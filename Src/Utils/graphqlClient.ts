import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_SUPABASE_GRAPHQL_URL!;

export const graphqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_KEY!}`,
  },
});




//3d15303c-96e5-4256-9d34-b97b3d546471&email=mert.sanlii09@gmail.com


//{
//     "name":"nextcut",
//     "phone":"+97112345678",
//     "company_name":"nextcut",
//     "email":"tahir@drivenproperties.com",
//     "supertoken_token":"f70fe8f8-343b-4ebe-94fc-7db3c19441f5",
//     "password":"SQN6889"
// }