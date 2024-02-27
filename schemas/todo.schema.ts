import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.scheme';

export type TodoDocument = HydratedDocument<Todo>;

@Schema()
export class Todo {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: User

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  startDateTime: Date;

  @Prop()
  endDateTime: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
