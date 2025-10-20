import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

// Extend CreatePostDto with PartialType so all fields are optional for updates.
// Explicitly redeclare `tags` so TypeScript can see it when destructuring
// (some versions of mapped-types erase property names in .d.ts).
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
