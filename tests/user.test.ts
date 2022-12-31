import { createYoga } from 'graphql-yoga'
import { schema } from '../src/schema'

test('user query test', async () => {
    const yoga = createYoga({ schema })
    const response = await yoga.fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '{ user }',
  }),
})
expect(response.status).toBe(200)
console.log(response)
});