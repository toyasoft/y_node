/**
 * @generated SignedSource<<50207730175100d015506b664009c10b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type itemIndexQuery$variables = {};
export type itemIndexQuery$data = {
  readonly items: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly point: number;
    readonly username: string | null;
  }> | null;
};
export type itemIndexQuery = {
  response: itemIndexQuery$data;
  variables: itemIndexQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Item",
    "kind": "LinkedField",
    "name": "items",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "point",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "itemIndexQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "itemIndexQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b9cb0b677d5e80346898d9119a07fba8",
    "id": null,
    "metadata": {},
    "name": "itemIndexQuery",
    "operationKind": "query",
    "text": "query itemIndexQuery {\n  items {\n    id\n    name\n    point\n    username\n  }\n}\n"
  }
};
})();

(node as any).hash = "add3e18cfd4a0f8d07dd75e68b7ba056";

export default node;
