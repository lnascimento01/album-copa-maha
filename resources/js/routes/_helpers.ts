export type RouteMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type RouteDefinition<TMethod extends RouteMethod = RouteMethod> = {
    url: string;
    method: TMethod;
};

export type FormDefinition<TMethod extends RouteMethod = RouteMethod> = {
    action: string;
    method: TMethod;
};

export type RouteHelper<TMethod extends RouteMethod = RouteMethod> = (() => RouteDefinition<TMethod>) & {
    url: string;
    method: TMethod;
    form: () => FormDefinition<TMethod>;
};

export type ParameterizedRouteHelper<
    TParameter extends string | number,
    TMethod extends RouteMethod = RouteMethod,
> = ((parameter: TParameter) => RouteDefinition<TMethod>) & {
    url: (parameter: TParameter) => string;
    method: TMethod;
    form: (parameter: TParameter) => FormDefinition<TMethod>;
};

export function route<TMethod extends RouteMethod>(
    method: TMethod,
    url: string,
): RouteHelper<TMethod> {
    const definition = () => ({ url, method });

    definition.url = url;
    definition.method = method;
    definition.form = () => ({ action: url, method });

    return definition;
}

export function parameterizedRoute<
    TParameter extends string | number,
    TMethod extends RouteMethod,
>(
    method: TMethod,
    url: (parameter: TParameter) => string,
): ParameterizedRouteHelper<TParameter, TMethod> {
    const definition = (parameter: TParameter) => ({
        url: url(parameter),
        method,
    });

    definition.url = url;
    definition.method = method;
    definition.form = (parameter: TParameter) => ({
        action: url(parameter),
        method,
    });

    return definition;
}
