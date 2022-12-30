/**
 * @generated SignedSource<<b3967a44bba488aad005f6276aed27bd>>
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
    readonly image: string | null;
    readonly name: string;
    readonly price: number;
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
        "name": "price",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "image",
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
    "cacheID": "595a562e94ee4031ff5d3e2e0ea17c09",
    "id": null,
    "metadata": {},
    "name": "itemIndexQuery",
    "operationKind": "query",
    "text": "query itemIndexQuery {\n  items {\n    id\n    name\n    price\n    username\n    image\n  }\n}\n"
  }
};
})();

(node as any).hash = "cb4bd7d00191973efb2c781474b271b3";

export default node;
