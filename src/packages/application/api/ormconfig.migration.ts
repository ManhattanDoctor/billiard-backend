import { AppModule, AppSettings } from './src';
import { DataSource } from 'typeorm';

export default new DataSource(AppModule.getOrmConfig(new AppSettings())[0] as any);



