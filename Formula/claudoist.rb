class Claudoist < Formula
  desc "AI-native customer success workbench CLI"
  homepage "https://github.com/tdiderich/claudoist"
  url "https://github.com/tdiderich/claudoist/archive/refs/tags/v0.0.3.tar.gz"
  sha256 "1477ee3690c090879420014ccbb3ca87f04974df1b84a81e63f63f4b4b2219b0"
  head "https://github.com/tdiderich/claudoist.git", branch: "main"

  depends_on "node"

  def install
    libexec.install "claudoist"
    libexec.install "package.json"
    libexec.install "package-lock.json" if File.exist?("package-lock.json")
    libexec.install "templates", "prompts", "schemas", "scripts", "playbooks"
    libexec.install "README.md", "CHANGELOG.md", "AGENTS.md", "claudoist.config", "TODOS.example.md"

    system "npm", "install", "--omit=dev", "--prefix", libexec

    bin.write_exec_script libexec/"claudoist"
  end

  test do
    system "#{bin}/claudoist", "--help"
  end
end
