# ADR: Firebase Functions Architecture and CI/CD Pipeline

**Status:** Accepted  
**Date:** 2025-05-06  
**Context:** Need to implement a simple API endpoint and CI/CD pipeline for a Firebase Functions project with multiple deployment environments.

## Context

The project requires:
1. A simple GET endpoint that returns a hello message
2. The ability to easily switch between different Firebase projects
3. A CI/CD pipeline that automatically deploys to different Firebase projects based on the branch

## Decision

We have implemented the following architecture:

1. **Firebase Functions with TypeScript**
   - Using Firebase Functions v2 HTTP triggers for the API endpoint
   - TypeScript for type safety and better developer experience
   - Structured logging for operational visibility

2. **Multi-Project Configuration**
   - Using Firebase project aliases in `.firebaserc` to enable easy switching between projects
   - Default project: `chris-cole-test` (development/testing environment)
   - Live project: `structify-chris-cole` (production environment)

3. **CI/CD Pipeline with GitHub Actions**
   - Automated deployment triggered on pushes to specific branches
   - Branch-based deployment strategy:
     - `master` branch → `structify-chris-cole` (production)
     - `testing` branch → `chris-cole-test` (development/testing)
   - Build and deployment steps are isolated and clearly defined

## Rationale

1. **Firebase Functions v2**
   - Provides improved performance and features over v1
   - Better regional control and configuration options
   - Enhanced CORS support

2. **Multi-Project Configuration**
   - Separates development/testing from production environments
   - Allows for testing changes in isolation before production deployment
   - Enables easy manual switching between environments for local development

3. **Branch-Based CI/CD**
   - Automates the deployment process, reducing manual errors
   - Enforces environment separation through Git branch strategy
   - Provides clear traceability between code changes and deployments

## Consequences

### Positive

- Clear separation between development and production environments
- Automated deployments reduce manual effort and potential for errors
- Type safety with TypeScript improves code quality and maintainability
- Project structure follows Firebase best practices

### Negative

- Requires setting up GitHub secrets for CI/CD
- Developers need to be aware of the branch strategy for proper deployments
- Multiple Firebase projects incur separate billing

## Future Considerations

- Add unit and integration tests to the CI/CD pipeline
- Implement staging environment between testing and production
- Consider adding API versioning strategy as the API grows
- Implement monitoring and alerting for the functions