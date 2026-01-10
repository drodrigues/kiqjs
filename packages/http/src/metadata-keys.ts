export const META_REST_CONTROLLER = Symbol('kiq:http:rest-controller');
export const META_REQUEST_MAPPING = Symbol('kiq:http:request-mapping');
export const META_ROUTE_HANDLER = Symbol('kiq:http:route-handler');
export const META_PARAM_METADATA = Symbol('kiq:http:param-metadata');
export const META_DTO_CLASS = Symbol('kiq:http:dto-class');
export const META_VALIDATE_OPTIONS = Symbol('kiq:http:validate-options');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface RequestMappingMetadata {
  path: string;
  method?: HttpMethod | HttpMethod[];
}

export interface RouteHandlerMetadata {
  path: string;
  method: HttpMethod;
  propertyKey: string;
  middlewares?: Function[];
}

export interface ParamMetadata {
  index: number;
  type: 'body' | 'files' | 'param' | 'query' | 'header' | 'ctx' | 'req' | 'res';
  name?: string;
  required?: boolean;
  dtoClass?: new () => any;
}
