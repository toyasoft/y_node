/**
 * @generated SignedSource<<fe22b6f71d9fe3256b4b7200bb57594c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type SigninInput = {
  email: string;
  password: string;
};
export type signinMutation$variables = {
  input: SigninInput;
};
export type signinMutation$data = {
  readonly signin: {
    readonly user: {
      readonly email: string;
    };
    readonly userToken: string;
  };
};
export type signinMutation = {
  response: signinMutation$data;
  variables: signinMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userToken",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "signinMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SigninPayload",
        "kind": "LinkedField",
        "name": "signin",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "signinMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SigninPayload",
        "kind": "LinkedField",
        "name": "signin",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "631f550ae34e590526128a40ce411000",
    "id": null,
    "metadata": {},
    "name": "signinMutation",
    "operationKind": "mutation",
    "text": "mutation signinMutation(\n  $input: SigninInput!\n) {\n  signin(input: $input) {\n    user {\n      email\n      id\n    }\n    userToken\n  }\n}\n"
  }
};
})();

(node as any).hash = "22f345b0ca81ee860ff2351d4f1c330c";

export default node;
