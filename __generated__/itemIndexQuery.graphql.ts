/**
 * @generated SignedSource<<7ff1e6de1f6f06480bbe8a8e00f38ed9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type itemIndexQuery$variables = {};
export type itemIndexQuery$data = {
  readonly items: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly point: number;
    readonly username: string | null;
    readonly " $fragmentSpreads": FragmentRefs<"OrderCreate_item">;
  }> | null;
};
export type itemIndexQuery = {
  response: itemIndexQuery$data;
  variables: itemIndexQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "point",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "itemIndexQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "OrderCreate_item"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "itemIndexQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3aa9dd78adc40048597d86618bbd51df",
    "id": null,
    "metadata": {},
    "name": "itemIndexQuery",
    "operationKind": "query",
    "text": "query itemIndexQuery {\n  items {\n    id\n    name\n    point\n    username\n    ...OrderCreate_item\n  }\n}\n\nfragment OrderCreate_item on Item {\n  id\n}\n"
  }
};
})();

(node as any).hash = "e40adaa6f939863b2b0438ddccb6a212";

export default node;
