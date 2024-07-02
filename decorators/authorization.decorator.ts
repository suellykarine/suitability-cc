import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { AuthorizationInterceptor } from 'interceptors/authorization.interceptor';

export function ModifyAuthorization() {
  return applyDecorators(UseInterceptors(AuthorizationInterceptor));
}
