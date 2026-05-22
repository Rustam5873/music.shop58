// cart.js - работа с корзиной

// Получить текущего пользователя
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Добавить товар в корзину
async function addToCart(productId, quantity = 1) {
    const user = await getCurrentUser();
    
    if (!user) {
        alert('Войдите в аккаунт, чтобы добавить товар в корзину');
        return false;
    }

    const { data, error } = await supabase
        .from('cart')
        .upsert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity
        }, {
            onConflict: 'user_id, product_id'
        });

    if (error) {
        console.error('Ошибка добавления:', error);
        alert('Ошибка при добавлении товара');
        return false;
    }
    
    // Обновляем счетчик корзины в шапке
    updateCartCount();
    return true;
}

// Получить корзину текущего пользователя
async function getUserCart() {
    const user = await getCurrentUser();
    
    if (!user) return [];

    const { data, error } = await supabase
        .from('cart')
        .select(`
            id,
            quantity,
            product_id,
            products (
                id,
                name,
                description,
                price,
                category
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        console.error('Ошибка получения корзины:', error);
        return [];
    }
    
    return data || [];
}

// Обновить количество товара
async function updateCartItemQuantity(cartId, newQuantity) {
    if (newQuantity <= 0) {
        return removeFromCart(cartId);
    }

    const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', cartId);

    if (error) {
        console.error('Ошибка обновления:', error);
        return false;
    }
    
    updateCartCount();
    return true;
}

// Удалить товар из корзины
async function removeFromCart(cartId) {
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

    if (error) {
        console.error('Ошибка удаления:', error);
        return false;
    }
    
    updateCartCount();
    return true;
}

// Очистить всю корзину
async function clearCart() {
    const user = await getCurrentUser();
    
    if (!user) return;

    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Ошибка очистки:', error);
    }
    
    updateCartCount();
}

// Получить количество товаров в корзине (для счетчика)
async function getCartTotalCount() {
    const cart = await getUserCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    return total;
}

// Обновить счетчик корзины в шапке сайта
async function updateCartCount() {
    const user = await getCurrentUser();
    
    // Показываем счетчик только авторизованным
    if (!user) {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.style.display = 'none';
        });
        return;
    }
    
    const count = await getCartTotalCount();
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(el => {
        el.style.display = 'inline-block';
        el.textContent = count;
    });
}

// Проверить авторизацию (редирект если не авторизован)
function requireAuth() {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = 'login.html';
        }
    });
}