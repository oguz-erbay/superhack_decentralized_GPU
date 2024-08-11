export const verifyToken = async (token) => {
    try {
      const response = await fetch("https://verify.worldcoin.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
  
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };
  