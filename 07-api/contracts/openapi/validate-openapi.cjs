const fs = require("node:fs");
const path = require("node:path");
const SwaggerParser = require("@apidevtools/swagger-parser");
const YAML = require("yaml");

async function main() {
  const directory = __dirname;
  const files = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".yaml"))
    .sort();
  const errors = [];
  const parsedDocuments = new Map();

  for (const name of files) {
    const file = path.join(directory, name);
    try {
      const document = YAML.parseDocument(fs.readFileSync(file, "utf8"), {
        uniqueKeys: true,
      });
      if (document.errors.length) {
        throw new Error(document.errors.map((error) => error.message).join("; "));
      }
      parsedDocuments.set(name, document.toJS());
      await SwaggerParser.validate(file);
      console.log(`PASS ${name}: YAML, OpenAPI schema, and references`);
    } catch (error) {
      errors.push({ name, message: error.message });
      console.error(`FAIL ${name}: ${error.message}`);
    }
  }

  const assertions = [];
  const check = (name, condition) => {
    assertions.push({ name, passed: Boolean(condition) });
  };
  const objectAt = (value, path) =>
    path.split(".").reduce((current, key) => current?.[key], value);
  const response = (document, path, method, status) =>
    objectAt(document, `paths.${path}.${method}.responses.${status}`);
  const bodyRef = (responseObject, mediaType = "application/json") =>
    responseObject?.content?.[mediaType]?.schema?.$ref;
  const requestRef = (operation) =>
    operation?.requestBody?.content?.["application/json"]?.schema?.$ref;
  const fields = (schema, expected) =>
    expected.every((field) => Object.hasOwn(schema?.properties ?? {}, field));
  const equalArray = (actual, expected) =>
    JSON.stringify(actual) === JSON.stringify(expected);
  const fleet = parsedDocuments.get("bus-service.yaml");
  const route = parsedDocuments.get("route-service.yaml");
  const notification = parsedDocuments.get("notification-service.yaml");
  const users = parsedDocuments.get("user-management-service.yaml");
  const iam = parsedDocuments.get("iam-service.yaml");
  const gps = parsedDocuments.get("gps-service.yaml");
  const school = parsedDocuments.get("school-service.yaml");

  if ([fleet, route, notification, users, iam, gps, school].every(Boolean)) {
    check(
      "fleet create request and response use source DTO schemas",
      requestRef(fleet.paths["/buses"].post) === "#/components/schemas/CreateBusRequest" &&
        bodyRef(response(fleet, "/buses", "post", "200")) === "#/components/schemas/CreateBusResponse",
    );
    check(
      "fleet detail models nullable GPS fields and update is bodyless",
      fields(fleet.components.schemas.BusDetail, [
        "id", "campuseId", "soatValidity", "gpsDeviceId", "capacity", "modelId",
        "gpsImei", "gpsStatus", "driverProfileId",
      ]) &&
        fleet.components.schemas.BusDetail.properties.gpsStatus.nullable === true &&
        response(fleet, "/buses/{id}", "put", "204")?.content === undefined,
    );
    check(
      "fleet status request restricts values to the source enum",
      equalArray(fleet.components.schemas.ChangeBusStatusRequest.properties.status.enum, [
        "Active",
        "Inactive",
      ]),
    );
    check(
      "fleet maps ProblemDetails and assignment text errors distinctly",
      response(fleet, "/buses/{id}", "put", "400")?.$ref ===
        "#/components/responses/ProblemBadRequest" &&
        fleet.components.responses.ProblemBadRequest.content["application/problem+json"].schema.$ref ===
          "#/components/schemas/ProblemDetails" &&
        response(fleet, "/buses/{busId}/driver", "put", "400")?.$ref ===
          "#/components/responses/TextBadRequest" &&
        fleet.components.responses.TextBadRequest.content["text/plain"].schema.type === "string",
    );
    check(
      "route list/create/update use distinct actual DTOs and status semantics",
      route.paths["/routes"].get.responses["200"].content["application/json"].schema.items.$ref ===
        "#/components/schemas/RouteListItem" &&
        requestRef(route.paths["/routes"].post) === "#/components/schemas/RouteRequest" &&
        bodyRef(response(route, "/routes", "post", "200")) === "#/components/schemas/RouteResponse" &&
        route.paths["/routes/{id}"].put.responses["200"].content === undefined,
    );
    check(
      "route schedule and trip operations match request and response DTOs",
      requestRef(route.paths["/routes/{id}/schedules"].post) === "#/components/schemas/CreateRouteSchedulesRequest" &&
        route.components.schemas.CreateRouteSchedulesRequest.allOf[1].required.includes("daysOfWeek") &&
        route.components.schemas.CreateRouteSchedulesRequest.allOf[1].properties.daysOfWeek.minItems === 1 &&
        route.paths["/routes/{id}/schedules"].post.responses["200"].content["application/json"].schema.items.$ref ===
          "#/components/schemas/ScheduleDetail" &&
        bodyRef(response(route, "/trips/end", "post", "200")) === "#/components/schemas/Trip" &&
        bodyRef(response(route, "/trips/status", "get", "200")) === "#/components/schemas/TripStatus",
    );
    check(
      "route lifecycle enum and error shape match source middleware",
      equalArray(route.components.schemas.TripStatus.properties.status.enum, [0, 1, 2, 3, 4]) &&
        route.paths["/routes/current"].get.parameters?.[0]?.required === false &&
        route.paths["/routes/today"].get.parameters?.[0]?.required === false &&
        route.paths["/routes/student/{studentId}"].get.parameters.some((parameter) => parameter.name === "isParent") &&
        response(route, "/routes/current", "get", "409") !== undefined &&
        bodyRef(route.components.responses.BadRequest, "application/problem+json") ===
          "#/components/schemas/ProblemDetails" &&
        response(route, "/routes/{id}/students", "post", "404") === undefined,
    );
    check(
      "notification endpoints use response and request DTOs",
      bodyRef(response(notification, "/api/v1/notifications/alerts", "get", "200")) ===
        "#/components/schemas/AlertsResponse" &&
        bodyRef(response(notification, "/api/v1/notifications/incidents", "post", "200")) ===
          "#/components/schemas/IncidentResponse" &&
        requestRef(notification.paths["/api/v1/notifications/scan"].post) ===
          "#/components/schemas/ProcessScanRequest" &&
        bodyRef(response(notification, "/api/v1/notifications/credential", "get", "200")) ===
          "#/components/schemas/Credential",
    );
    check(
      "notification enum JSON values and conflict body are exact",
      notification.components.schemas.AlertListItem.properties.alertType.type === "string" &&
        equalArray(notification.components.schemas.AlertListItem.properties.alertType.enum, ["ON_BOARD", "OFF_BOARD"]) &&
        notification.components.schemas.IncidentListItem.properties.incidentType.type === "integer" &&
        equalArray(notification.components.schemas.IncidentListItem.properties.incidentType.enum, [1, 2, 3, 4, 255]) &&
        bodyRef(response(notification, "/api/v1/notifications/scan", "post", "409")) ===
          "#/components/schemas/MessageError",
    );
    check(
      "family request, response, and member DTOs are explicit",
      requestRef(users.paths["/families"].post) === "#/components/schemas/RegisterFamilyRequest" &&
        bodyRef(response(users, "/families", "post", "200")) ===
          "#/components/schemas/RegisterFamilyResponse" &&
        users.components.schemas.RegisterFamilyRequest.properties.members.items.$ref ===
          "#/components/schemas/FamilyMemberRequest" &&
        fields(users.components.schemas.RegisteredFamilyMember, ["memberId", "profileId"]),
    );
    check(
      "license wire enum differs correctly between request and response",
      requestRef(users.paths["/driver-licenses"].post) ===
        "#/components/schemas/DriverLicenseRequest" &&
        bodyRef(response(users, "/driver-licenses", "post", "200")) ===
          "#/components/schemas/CreateDriverLicenseResponse" &&
        users.components.schemas.UpdateDriverLicenseRequest.properties.status.type === "string" &&
        users.components.schemas.DriverLicense.allOf[1].properties.status.type === "integer" &&
        equalArray(users.components.schemas.DriverLicense.allOf[1].properties.status.enum, [0, 1]),
    );
    check(
      "pre-existing person and GPS contract corrections remain represented",
      equalArray(users.components.schemas.PersonResponse.allOf[1].properties.identificationType.enum, [0, 1]) &&
        users.components.schemas.CreatePersonRequest.allOf[1].properties.campusId.format === "uuid" &&
        Object.keys(gps.paths).length === 4 &&
      fields(gps.components.schemas.GpsLocation, ["imei", "latitude", "longitude", "speed", "course"]) &&
      school.components.schemas.SchoolCampusRequest.properties.address.maxLength === 255 &&
      school.components.schemas.SchoolCampusRequest.properties.latitude.nullable === true &&
      school.components.schemas.SchoolCampusRequest.properties.longitude.nullable === true,
    );
    check(
      "IAM terms, errors, and case-insensitive channel semantics are explicit",
      bodyRef(response(iam, "/api/v1/auth/terms/status", "get", "200")) ===
        "#/components/schemas/TermsStatus" &&
        fields(iam.components.schemas.ErrorResponse, [
          "timestamp", "status", "error", "message", "path", "validationErrors",
        ]) &&
        iam.components.schemas.AcceptTermsRequest.properties.channel.pattern ===
          "^([Ww][Ee][Bb]|[Mm][Oo][Bb][Ii][Ll][Ee])$",
    );
  } else {
    check("semantic assertions run only after all required documents parse", false);
  }

  for (const assertion of assertions) {
    if (assertion.passed) console.log(`PASS semantic: ${assertion.name}`);
    else {
      errors.push({ name: "semantic", message: assertion.name });
      console.error(`FAIL semantic: ${assertion.name}`);
    }
  }

  const passedFiles = files.length - errors.filter((error) => error.name !== "semantic").length;
  const failedAssertions = assertions.filter((assertion) => !assertion.passed).length;
  console.log(
    `Validated ${files.length} YAML documents; ${passedFiles} passed; ${files.length - passedFiles} failed. ` +
      `Schema/semantic assertions: ${assertions.length - failedAssertions} passed; ${failedAssertions} failed.`,
  );
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
