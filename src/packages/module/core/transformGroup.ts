import { TransformGroup } from "@project/module/database";

export let TRANSFORM_PUBLIC = [TransformGroup.PUBLIC];
export let TRANSFORM_PRIVATE = [...TRANSFORM_PUBLIC, TransformGroup.PRIVATE];
export let TRANSFORM_ADMINISTRATOR = [TransformGroup.ADMINISTRATOR, TransformGroup.PRIVATE, TransformGroup.PUBLIC];

