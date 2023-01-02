/**
 * @generated SignedSource<<d5e834b7c57e12d9f13fd36c7f7d7edf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateItemInput = {
  name: string;
  point: number;
};
export type newItemMutation$variables = {
  input: CreateItemInput;
};
export type newItemMutation$data = {
  readonly createItem: {
    readonly item: {
      readonly id: string;
      readonly name: string;
      readonly point: number;
      readonly username: string | null;
    };
  };
};
export type newItemMutation = {
  response: newItemMutation$data;
  variables: newItemMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateItemPayload",
    "kind": "LinkedField",
    "name": "createItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newItemMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newItemMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fd65a5d6eb304383c7db9839bb3f2e0d",
    "id": null,
    "metadata": {},
    "name": "newItemMutation",
    "operationKind": "mutation",
    "text": "mutation newItemMutation(\n  $input: CreateItemInput!\n) {\n  createItem(input: $input) {\n    item {\n      id\n      name\n      point\n      username\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "934484c8c32180a01a8698d63a993e95";

export default node;
