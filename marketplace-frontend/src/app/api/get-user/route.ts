export async function GET(req: Request) {
  const userHeader = req.headers.get("x-user");

  console.log(userHeader);
  console.log(req);

  if (userHeader) {
    const user = JSON.parse(userHeader);
    return new Response(JSON.stringify(user), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}
