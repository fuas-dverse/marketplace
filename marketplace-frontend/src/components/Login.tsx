// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const res = await fetch(`api/users/${username}`).then((res) =>
//         res.json()
//       );
//       console.log(res);

//       if (res.error) {
//         throw new Error("Failed to log in");
//       }

//       // Save the user ID to sessionStorage
//       if (typeof window !== "undefined") {
//         sessionStorage.setItem("username", res.username);
//       }

//       window.location.reload();
//       router.push("/");
//     } catch (err: unknown) {
//       setError(
//         err instanceof Error ? err.message : "An unknown error occurred"
//       );
//     }
//   };

//   return (
//     <div className="flex justify-center items-center">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 shadow-lg rounded-md space-y-4"
//       >
//         <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder="Enter your username"
//           className="w-full p-2 border border-gray-300 rounded-md"
//         />
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder="Enter your username"
//           className="w-full p-2 border border-gray-300 rounded-md"
//         />
//         <button
//           type="submit"
//           className="w-full bg-purple-950 text-white p-2 rounded-md hover:bg-purple-900 transition"
//         >
//           Login
//         </button>
//         {error && <p className="text-red-500 text-center mt-4">{error}</p>}
//       </form>
//     </div>
//   );
// }
