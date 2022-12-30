/**
 * @generated SignedSource<<e90abb597102c4b52f0f56993bfd7b0d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemDelete_item$data = {
  readonly id: string;
  readonly " $fragmentType": "ItemDelete_item";
};
export type ItemDelete_item$key = {
  readonly " $data"?: ItemDelete_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemDelete_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemDelete_item",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Item",
  "abstractKey": null
};

(node as any).hash = "764d2fe754d4dd023e92ea5c32951d5e";

export default node;
