class Claudoist < Formula
  desc "AI-native customer success workbench CLI"
  homepage "https://github.com/tdiderich/claudoist"
  url "https://github.com/tdiderich/claudoist/archive/refs/tags/v0.0.1.tar.gz"
  sha256 "3062df439a61c5092b2b6f620bda3f5c6e796c5dbfd9d1857d5e49304f40e27d"
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
