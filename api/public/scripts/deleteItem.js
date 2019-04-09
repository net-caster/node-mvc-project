const deleteItem = async (btn) => {
    const itemId = btn.parentNode.querySelector('[name=itemId]').value;
    const itemElement = btn.closest('article');
    try {
        const result = await fetch('/admin/item/' + itemId, {
            method: 'DELETE'
        });
        const data = await result.json();
        console.log(data);
        console.log(itemElement);
        return itemElement.parentNode.removeChild(itemElement);
    } catch (err) {
        console.log(err);
    }
};