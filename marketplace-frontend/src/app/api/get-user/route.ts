export async function GET(req: Request) {
  const userHeader = req.headers.get("x-user");

  if (userHeader) {
    const user = JSON.parse(userHeader);
    return new Response(JSON.stringify(user.user), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}
