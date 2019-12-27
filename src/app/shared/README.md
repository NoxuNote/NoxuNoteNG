https://angular.io/guide/sharing-ngmodules

## Sharing services
Using components vs services from other modules
There is an important distinction between using another module's component and using a service from another module. Import modules when you want to use directives, pipes, and components. Importing a module with services means that you will have a new instance of that service, which typically is not what you need (typically one wants to reuse an existing service). Use module imports to control service instantiation.

The most common way to get a hold of shared services is through Angular dependency injection, rather than through the module system (importing a module will result in a new service instance, which is not a typical usage).

To read about sharing services, see Providers.