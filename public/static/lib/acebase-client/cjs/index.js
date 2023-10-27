"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = exports.PartialArray = exports.proxyAccess = exports.ID = exports.ObjectCollection = exports.TypeMappings = exports.PathReference = exports.EventSubscription = exports.EventStream = exports.DataReferencesArray = exports.DataSnapshotsArray = exports.DataSnapshot = exports.DataReference = exports.CachedValueUnavailableError = exports.ServerDate = exports.AceBaseUser = exports.AceBaseClientAuth = exports.AceBaseClient = void 0;
/**
   ________________________________________________________________________________

      ___          ______
     / _ \         | ___ \
    / /_\ \ ___ ___| |_/ / __ _ ___  ___
    |  _  |/ __/ _ \ ___ \/ _` / __|/ _ \
    | | | | (_|  __/ |_/ / (_| \__ \  __/
    \_| |_/\___\___\____/ \__,_|___/\___|
                 realtime database client

   Copyright 2018-2022 by Ewout Stortenbeker <http://appy.one>
   Released under MIT license

   See docs at https://github.com/appy-one/acebase-client
   ________________________________________________________________________________

*/
/*!
 * AceBaseClient
 * (c) 2018-2022 Ewout Stortenbeker <http://appy.one>
 * Released under MIT license
 */
var acebase_client_1 = require("./acebase-client");
Object.defineProperty(exports, "AceBaseClient", { enumerable: true, get: function () { return acebase_client_1.AceBaseClient; } });
var auth_1 = require("./auth");
Object.defineProperty(exports, "AceBaseClientAuth", { enumerable: true, get: function () { return auth_1.AceBaseClientAuth; } });
var user_1 = require("./user");
Object.defineProperty(exports, "AceBaseUser", { enumerable: true, get: function () { return user_1.AceBaseUser; } });
var server_date_1 = require("./server-date");
Object.defineProperty(exports, "ServerDate", { enumerable: true, get: function () { return server_date_1.ServerDate; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "CachedValueUnavailableError", { enumerable: true, get: function () { return errors_1.CachedValueUnavailableError; } });
var acebase_core_1 = require("acebase-core");
Object.defineProperty(exports, "DataReference", { enumerable: true, get: function () { return acebase_core_1.DataReference; } });
Object.defineProperty(exports, "DataSnapshot", { enumerable: true, get: function () { return acebase_core_1.DataSnapshot; } });
Object.defineProperty(exports, "DataSnapshotsArray", { enumerable: true, get: function () { return acebase_core_1.DataSnapshotsArray; } });
Object.defineProperty(exports, "DataReferencesArray", { enumerable: true, get: function () { return acebase_core_1.DataReferencesArray; } });
Object.defineProperty(exports, "EventStream", { enumerable: true, get: function () { return acebase_core_1.EventStream; } });
Object.defineProperty(exports, "EventSubscription", { enumerable: true, get: function () { return acebase_core_1.EventSubscription; } });
Object.defineProperty(exports, "PathReference", { enumerable: true, get: function () { return acebase_core_1.PathReference; } });
Object.defineProperty(exports, "TypeMappings", { enumerable: true, get: function () { return acebase_core_1.TypeMappings; } });
Object.defineProperty(exports, "ObjectCollection", { enumerable: true, get: function () { return acebase_core_1.ObjectCollection; } });
Object.defineProperty(exports, "ID", { enumerable: true, get: function () { return acebase_core_1.ID; } });
Object.defineProperty(exports, "proxyAccess", { enumerable: true, get: function () { return acebase_core_1.proxyAccess; } });
Object.defineProperty(exports, "PartialArray", { enumerable: true, get: function () { return acebase_core_1.PartialArray; } });
Object.defineProperty(exports, "Transport", { enumerable: true, get: function () { return acebase_core_1.Transport; } });
//# sourceMappingURL=index.js.map