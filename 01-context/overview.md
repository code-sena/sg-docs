# System Overview

> **Instructions:** Replace this content with your project's description.
> This is the first page someone new reads. They must be able to understand the system in 5 minutes.
> Remove these instructions when the document is complete.

---

## What is [System Name]?

School Guaridian, it is an innovative solution for the real-time control and monitoring of school routes. In an environment where the safety and peace of mind of parents is a priority, this platform becomes much more than a tracking tool: it is a reliable companion that ensures the well-being of students on every journey to and from their educational institutions.

## Problem it solves

**Before the system:** In Colombia, school transportation is essential for thousands of families, but it still lacks effective mechanisms that allow parents to know the real-time status of their children during the journey. The lack of control over students getting on and off the buses creates uncertainty and potential safety risks.

**With the system:** In response to this need, “Guardian Escolar” (School Guardian) was created—a technological solution that allows for real-time monitoring of school routes, using QR codes to accurately record student movements. This platform aims to improve communication between parents, schools, and transportation providers, ensuring a safer and more reliable environment for children during their daily commute.

## Main users

| Role | Description | What they do in the system |
|------|-------------|--------------------------|
| Admin | Responsible for managing users, routes, buses, and stops. This person works within the school. | create, update, delete and list |
| Driver | driver in charge of the route | can drive a bus and scan QR codes |
| Student | This is our target user, who is provided with real-time location and information on boarding procedures. |  |
| Father | User who is given information about the route, location and boarding of their respective child. | View route and view notifications |

## Technology stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend Web | Angular | It's the ideal choice because it offers a robust architecture geared towards building complex administration panels. Its component system allows you to organize the interface into clear sections (such as route listings, user tables, creation forms, and route maps), making it easier for administrators to perform critical tasks efficiently and without confusion. Furthermore, being backed by Google guarantees constant support and updates, as well as a very active community. |
| Frontend Mobile | React Native | React Native was chosen to develop the mobile application because it allows for the creation of Android and iOS applications using the same codebase, reducing development time, maintenance costs, and duplication of effort. Furthermore, it boasts a broad ecosystem, excellent documentation, and the ability to use JavaScript/TypeScript and React, technologies widely employed in software development. It also offers adequate performance for most mobile applications and facilitates integration with native functionalities when needed. |
| Backend | Spring Boot + Asp.Net + Go | for backend construction because they are mature technologies, widely used and with features that allow the development of robust, scalable, secure and high-performance applications. |
| Database | SQL Server | As a database engine, it stands out for its maturity, stability, security, and comprehensive set of information management tools. It is a suitable solution for applications requiring data consistency, transaction handling, complex queries, access control, and backup and recovery mechanisms. |
| Message broker | [RabbitMQ / Kafka] | [why] |
| Infrastructure | Docker | as a tool for building and deploying the application because it allows packaging each component along with its dependencies and configuration into containers, ensuring that the software runs consistently regardless of the environment where it is deployed. |

## Current status

- **Phase:** In development
- **Current version:** [v0.1.0]
- **Last release:** [date]
- **Next milestone:** [description and date]

## Project contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | [Name] | [email/Slack] |
| Product Owner | [Name] | [email/Slack] |
| DevOps | [Name] | [email/Slack] |
