const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (name.value && cost.value) {
    const item = {
      name: name.value,
      trosak: parseInt(cost.value),
    };

    db.collection('troskovi')
      .add(item)
      .then((res) => {
        error.textContent = '';
        name.value = '';
        cost.value = '';
        console.log(res);
      });
  } else {
    error.textContent = 'Please enter something';
  }
});
