const  deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach(button => {
    button.addEventListener('click', async e => {
        const btn = e.target;
        const cardActions = btn.closest('.card__actions');

        if(!cardActions) return;

        const idInput = cardActions.querySelector('input[name="id"]');
        const crsfInput = cardActions.querySelector('input[name="_csrfDeleteProduct"]');

        if(!idInput || !crsfInput) return;

        const id = idInput.value;
        const csrf = crsfInput.value;

        const response = await fetch(`/admin/product/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrf
            }
        }) 

       const data = await response.json();

         if(data.ok) {
            const card = cardActions.closest('.card');
            card.classList.add('fade-out');
            setTimeout(() => {
                card.remove();
            }, 500)
        }
        
    });
});