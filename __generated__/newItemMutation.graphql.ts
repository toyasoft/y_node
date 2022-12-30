/**
 * @generated SignedSource<<8f6dcbb54f4050fe644f9ac2b10e4c49>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateItemInput = {
  description?: string | null;
  image?: string | null;
  name: string;
  pric: number;
};
export type newItemMutation$variables = {
  input: CreateItemInput;
};
export type newItemMutation$data = {
  readonly createItem: {
    readonly item: {
      readonly description: string | null;
      readonly id: string;
      readonly image: string | null;
      readonly name: string;
      readonly price: number;
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
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
    "cacheID": "3a02dbd147274a22e3a42d5dd2fd197f",
    "id": null,
    "metadata": {},
    "name": "newItemMutation",
    "operationKind": "mutation",
    "text": "mutation newItemMutation(\n  $input: CreateItemInput!\n) {\n  createItem(input: $input) {\n    item {\n      id\n      name\n      price\n      username\n      image\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "520314348f214cbf05a7b75008165a4c";

export default node;
