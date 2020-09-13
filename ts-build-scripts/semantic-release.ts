export = {
  "plugins": [
    "@semantic-release/commit-analyzer",
    ["@semantic-release/npm", {
      "npmPublish": false,
      "tarballDir": "-",
    }],
    [
			"@semantic-release/git",
			{
				"message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
			}
		]
  ]
}
