/**
 * @generated SignedSource<<c675e32044b7e44a812698187a7536ef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type orderIndexQuery$variables = {};
export type orderIndexQuery$data = {
  readonly orders: ReadonlyArray<{
    readonly buyer: string;
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly seller: string;
  }> | null;
};
export type orderIndexQuery = {
  response: orderIndexQuery$data;
  variables: orderIndexQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Order",
    "kind": "LinkedField",
    "name": "orders",
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
        "name": "price",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buyer",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seller",
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
    "name": "orderIndexQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "orderIndexQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "a3a0d1e498468ca1f51261c1951fa9ba",
    "id": null,
    "metadata": {},
    "name": "orderIndexQuery",
    "operationKind": "query",
    "text": "query orderIndexQuery {\n  orders {\n    id\n    name\n    price\n    buyer\n    seller\n  }\n}\n"
  }
};
})();

(node as any).hash = "717d9755867ca65d6aa8b771e9912acc";

export default node;
