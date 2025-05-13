class RoutingMap {
    constructor() {
        this.routes = new Map();
    }

    // Method to add a route
    addRoute(path, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this.routes.set(path, handler);
    }

    // Method to get a handler for a given path
    getHandler(path) {
        return this.routes.get(path) || null;
    }

    // Method to check if a path exists
    hasRoute(path) {
        return this.routes.has(path);
    }

    // Method to delete a route
    deleteRoute(path) {
        return this.routes.delete(path);
    }
}

module.exports = RoutingMap;