import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
// 1. Add the following two imports
import * as mutations from '@/graphql/mutations';
import { revalidatePath } from 'next/cache';

import config from '@/amplifyconfiguration.json';
import { listTodos } from '@/graphql/queries';

const cookiesClient = generateServerClientUsingCookies({
	config,
	cookies,
});

// 2. Create a new Server Action
async function createTodo(formData: FormData) {
	'use server';
	const { data } = await cookiesClient.graphql({
		query: mutations.createTodo,
		variables: {
			input: {
				name: formData.get('name')?.toString() ?? '',
			},
		},
	});

	console.log('Created Todo: ', data?.createTodo);

	revalidatePath('/form');
}

export default async function Home() {
	const { data, errors } = await cookiesClient.graphql({
		query: listTodos,
	});
	const todos = data.listTodos.items;
	return (
		<div
			style={{
				maxWidth: '500px',
				margin: '0 auto',
				textAlign: 'center',
				marginTop: '100px',
			}}
		>
			{/* 3. Update the form's action to use the
          new create Todo Server Action*/}
			<form action={createTodo}>
				<input name='name' placeholder='Add a todo' className='text-black' />
				<button type='submit'>Add</button>
			</form>
			{/* 3. Handle edge cases & zero state & error states*/}
			{(!todos || todos.length === 0 || errors) && (
				<div>
					<p>No todos, please add one.</p>
				</div>
			)}

			{/* 4. Display todos*/}
			<ul>
				{todos.map((todo) => {
					return (
						<li key={todo.id} style={{ listStyle: 'none' }}>
							{todo.name}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
