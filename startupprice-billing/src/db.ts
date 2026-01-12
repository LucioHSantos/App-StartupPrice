/**
 * Banco de dados em memória temporário
 * 
 * TODO: Substituir por um banco de dados real (PostgreSQL, MongoDB, etc.)
 * quando integrar com o sistema principal.
 * 
 * Interface esperada:
 * - setUserPremium(userId: string, email: string): Promise<void>
 * - getUser(userId: string): Promise<{ email: string; isPremium: boolean } | null>
 */

interface User {
  email: string;
  isPremium: boolean;
}

// Map em memória: userId -> User
const users = new Map<string, User>();

/**
 * Define um usuário como Premium
 */
export async function setUserPremium(userId: string, email: string): Promise<void> {
  users.set(userId, {
    email,
    isPremium: true,
  });
  console.log(`[DB] Usuário marcado como Premium: userId=${userId}, email=${email}`);
}

/**
 * Obtém informações de um usuário
 */
export async function getUser(userId: string): Promise<{ email: string; isPremium: boolean } | null> {
  const user = users.get(userId);
  if (!user) {
    return null;
  }
  return { ...user };
}

/**
 * Verifica se um usuário é Premium
 */
export async function isUserPremium(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  return user?.isPremium ?? false;
}

/**
 * Cria ou atualiza um usuário (útil para testes)
 */
export async function setUser(userId: string, email: string, isPremium: boolean = false): Promise<void> {
  users.set(userId, { email, isPremium });
}

/**
 * Remove um usuário (útil para testes)
 */
export async function deleteUser(userId: string): Promise<void> {
  users.delete(userId);
}

/**
 * Limpa todos os usuários (útil para testes)
 */
export async function clearAllUsers(): Promise<void> {
  users.clear();
}



