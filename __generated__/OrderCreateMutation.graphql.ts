/**
 * @generated SignedSource<<ca32b844900a3ab5c9c0768428935a14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateOrderInput = {
  itemId: string;
};
export type OrderCreateMutation$variables = {
  input: CreateOrderInput;
};
export type OrderCreateMutation$data = {
  readonly createOrder: {
    readonly order: {
      readonly id: string;
    };
  };
};
export type OrderCreateMutation = {
  response: OrderCreateMutation$data;
  variables: OrderCreateMutation$variables;
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
    "concreteType": "CreateOrderPayload",
    "kind": "LinkedField",
    "name": "createOrder",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Order",
        "kind": "LinkedField",
        "name": "order",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "name": "OrderCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OrderCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3078551b3b6343925e2eeb9532311e21",
    "id": null,
    "metadata": {},
    "name": "OrderCreateMutation",
    "operationKind": "mutation",
    "text": "mutation OrderCreateMutation(\n  $input: CreateOrderInput!\n) {\n  createOrder(input: $input) {\n    order {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c1be8c7b57bd84d39de7e01bd38e55c4";

export default node;
