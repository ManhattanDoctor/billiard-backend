import * as path from 'path';

export const modulePath = () => __dirname;
export const nodeModulePath = () => path.resolve(__dirname, '../../../node_modules');
export const nodeModulePathBuild = () => path.resolve(__dirname, '../../../../node_modules');