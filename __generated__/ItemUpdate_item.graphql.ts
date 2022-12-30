/**
 * @generated SignedSource<<621c7f2d8c7beac4714801840cf8cc88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemUpdate_item$data = {
  readonly description: string | null;
  readonly id: string;
  readonly image: string | null;
  readonly name: string;
  readonly price: number;
  readonly " $fragmentType": "ItemUpdate_item";
};
export type ItemUpdate_item$key = {
  readonly " $data"?: ItemUpdate_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemUpdate_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemUpdate_item",
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
  "type": "Item",
  "abstractKey": null
};

(node as any).hash = "8ca173f8cb06c318fec8c66d65c4c23e";

export default node;
