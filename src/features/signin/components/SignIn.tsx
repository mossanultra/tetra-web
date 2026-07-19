import { signIn } from "../../../services/auth";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-col items-center gap-6 px-8 py-10 bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-black text-brand tracking-tight">Machip</span>
          <span className="text-sm text-gray-400">マップで繋がるコミュニティ</span>
        </div>

        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("cognito", {}, "lang=ja");
          }}
        >
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-gradient-to-r from-brand to-brand-mid text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            サインイン / 新規登録
          </button>
        </form>
      </div>
    </div>
  );
}
