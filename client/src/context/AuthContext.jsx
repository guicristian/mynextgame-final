import { createContext, useContext } from 'react';

// 1. Cria o contexto
export const AuthContext = createContext(null);

// 2. Cria e exporta o hook para usar o contexto
export const useAuth = () => {
    return useContext(AuthContext);
}