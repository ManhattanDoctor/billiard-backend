export enum TransformGroup {
    LIST = 'LIST',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    ANONYMOUS = 'ANONYMOUS',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export let TRANSFORM_SINGLE = [TransformGroup.PRIVATE, TransformGroup.PUBLIC];
export let TRANSFORM_PRIVATE = [TransformGroup.PRIVATE];
export let TRANSFORM_NOT_LIST = [TransformGroup.ADMINISTRATOR, TransformGroup.PRIVATE, TransformGroup.PUBLIC];
export let TRANSFORM_NOT_ANONYMOUS = [TransformGroup.PRIVATE, TransformGroup.PUBLIC, TransformGroup.LIST];