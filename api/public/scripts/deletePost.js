const deletePost = async (btn) => {
    const postId = btn.parentNode.querySelector('[name=postId]').value;
    const postElement = btn.closest('article');
    try {
        const result = await fetch('/admin/post/' + postId, {
            method: 'DELETE'
        });
        const data = await result.json();
        console.log(data);
        console.log(postElement);
        return postElement.parentNode.removeChild(postElement);
    } catch (err) {
        console.log(err);
    }
};