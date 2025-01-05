import { AppModule, AppSettings } from './src';
import { DataSource } from 'typeorm';

export default new DataSource(AppModule.getOrmConfig(new AppSettings())[1] as any);




