const { router } = require("../../routing/Router");

router.routingMap.addRoute("/", router.routingMap.getHandler('/index'));
