import { useState, useEffect } from "react";

const KEY = "ips_wishlist";

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(getWishlist);

  const add = (id: string) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const remove = (id: string) => {
    setWishlist(prev => {
      const next = prev.filter(x => x !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggle = (id: string) => {
    wishlist.includes(id) ? remove(id) : add(id);
  };

  const has = (id: string) => wishlist.includes(id);

  return { wishlist, add, remove, toggle, has };
}
