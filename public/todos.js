document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    }

    if(logoutBtn){
        logoutBtn.addEventListener('click',()=>{
            localStorage.removeItem('token');
            alert('Logged out successfully');
            setTimeout(()=>{
                window.location.href = '/login';
            },1000);
        })
    }

    const todoList = document.getElementById('todo-list');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');

    function fetchTodos() {
        axios.get('/todos', {
            headers: {
                'Authorization': token
            }
        })
        .then(response => {
            todoList.innerHTML = '';
            response.data.titles.forEach(title => {
                const li = document.createElement('li');
                li.textContent = title;
                todoList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
            if (error.response && error.response.status === 403) {
                window.location.href = '/login';
            }
        });
    }

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = todoInput.value.trim();
        if (title) {
            axios.post('/todo', { title }, {
                headers: {
                    'Authorization': token
                }
            })
            .then(() => {
                todoInput.value = '';
                fetchTodos();
            })
            .catch(error => {
                console.error('Error adding todo:', error);
            });
        }
    });


    

    fetchTodos();
});