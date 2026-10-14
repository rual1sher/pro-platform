export const addToken = (token: string, remember = true) => {
  if (remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
};

export const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return sessionStorage.getItem("token");
  }

  return token;
};

export const removeToken = () => {
  localStorage.clear();
  sessionStorage.clear();
};
