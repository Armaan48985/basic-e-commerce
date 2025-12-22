import { supabase } from "./supabase";

export const addToCart = async (userId: string, productId: number) => {
  console.log("🟡 addToCart START");
  console.log("userId:", userId);
  console.log("productId:", productId);

  await ensureProfile(userId)

  // get or create cart
  console.log("➡️ Fetching cart for user...");
  const { data: cart, error: cartFetchError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  console.log("Cart fetch result:", cart);
  console.log("Cart fetch error:", cartFetchError);

  let cartId = cart?.id;
  console.log("Derived cartId:", cartId);

  if (!cartId) {
    console.log("⚠️ No cart found. Creating new cart...");

    const { data: newCart, error: newCartError } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("*")
      .single();

    console.log("New cart insert result:", newCart);
    console.log("New cart insert error:", newCartError);

    if (newCartError) throw newCartError;

    cartId = newCart.id;
    console.log("New cartId:", cartId);
  }

  console.log("➡️ Checking if product already exists in cart...");
  const { data: item, error: itemFetchError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .single();

  console.log("Existing cart item:", item);
  console.log("Existing item fetch error:", itemFetchError);

  if (item) {
    console.log("🔁 Item exists. Updating quantity...");
    console.log("Old quantity:", item.quantity);
    console.log("New quantity:", item.quantity + 1);

    const result = await supabase
      .from("cart_items")
      .update({ quantity: item.quantity + 1 })
      .eq("id", item.id);

    console.log("Update result:", result);
    console.log("🟢 addToCart END (updated existing item)");
    return result;
  }

  console.log("➕ Item not found. Inserting new cart item...");
  const insertResult = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    quantity: 1,
  });

  console.log("Insert result:", insertResult);
  console.log("🟢 addToCart END (inserted new item)");
  return insertResult;
};


export const getCartForUser = async (userId: string) => {
  console.log("🟡 getCartForUser START");
  console.log("userId:", userId);

  console.log("➡️ Fetching cart id...");
  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  console.log("Cart data:", cartData);
  console.log("Cart fetch error:", cartError);

  if (cartError || !cartData) {
    console.log("❌ Failed to fetch cart for user");
    return { cartItems: null, error: cartError };
  }

  console.log("➡️ Fetching cart items for cartId:", cartData.id);
  const { data: cartItemsData, error: cartItemsError } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("cart_id", cartData.id);

  console.log("Cart items data:", cartItemsData);
  console.log("Cart items error:", cartItemsError);

  if (cartItemsError) {
    console.log("❌ Failed to fetch cart items");
    return { cartItems: null, error: cartItemsError };
  }

  console.log("🟢 getCartForUser END");
  return { cartItems: cartItemsData, error: null };
};


export const fetchProducts = async () => {
  console.log("🟡 fetchProducts START");

  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  console.log("Products data:", products);
  console.log("Products error:", error);

  if (error) {
    console.log("❌ fetchProducts FAILED");
    throw error;
  }

  console.log("🟢 fetchProducts END");
  return products;
};


;

export const ensureProfile = async (userId: string) => {
  console.log("[ensureProfile] Checking profile for:", userId);

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId });

  if (error) {
    console.error("[ensureProfile] Failed:", error);
    throw error;
  }

  console.log("[ensureProfile] Profile ensured");
};