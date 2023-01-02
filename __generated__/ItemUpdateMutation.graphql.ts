/**
 * @generated SignedSource<<a767f99ab29ac4e0ade83e08c5b52713>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateItemInput = {
  id: string;
  name: string;
  point: number;
};
export type ItemUpdateMutation$variables = {
  input: UpdateItemInput;
};
export type ItemUpdateMutation$data = {
  readonly updateItem: {
    readonly item: {
      readonly id: string;
      readonly name: string;
      readonly point: number;
      readonly username: string | null;
    };
  };
};
export type ItemUpdateMutation = {
  response: ItemUpdateMutation$data;
  variables: ItemUpdateMutation$variables;
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
    "concreteType": "UpdateItemPayload",
    "kind": "LinkedField",
    "name": "updateItem",
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
    "name": "ItemUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ItemUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8f6ed965518b8e38361e1adb83ebd6f5",
    "id": null,
    "metadata": {},
    "name": "ItemUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ItemUpdateMutation(\n  $input: UpdateItemInput!\n) {\n  updateItem(input: $input) {\n    item {\n      id\n      name\n      point\n      username\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "18e243d4b29e4bcc46b9f10b153fa999";

export default node;
