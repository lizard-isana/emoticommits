require 'test/unit'

$:.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))
require 'githubapi'

include GitHubApi

class TestApi < Test::Unit::TestCase
	def datapath(basename)
		File.join(File.dirname(__FILE__), 'sample-json', basename)
	end

	def test_timestamp
		t = Base.new(datapath('SingleCommitComment.json'))
		t.read_and_parse
		assert_equal(Time.utc(2013,4,12,18,1,44), t.timestamp)
	end
end

class TestSingleCommitComment < Test::Unit::TestCase
	def test_url
		t = SingleCommitComment.new('zunda', 'test', '1')
		assert_equal("#{Base::HOST}/repos/zunda/test/comments/1", t.url)
	end
end

class TestDownload < Test::Unit::TestCase
	def test_url
		t = Download.new('zunda', 'test', '1')
		assert_equal("#{Base::HOST}/repos/zunda/test/downloads/1", t.url)
	end
end

class TestGist < Test::Unit::TestCase
	def test_url
		t = Gist.new('1')
		assert_equal("#{Base::HOST}/gists/1", t.url)
	end
end

class TestSinglePullRequest < Test::Unit::TestCase
	def test_url
		t = SinglePullRequest.new('zunda', 'test', '1')
		assert_equal("#{Base::HOST}/repos/zunda/test/pulls/1", t.url)
	end
end

class TestCommit < Test::Unit::TestCase
	def test_url
		t = Commit.new('zunda', 'test', '1')
		assert_equal("#{Base::HOST}/repos/zunda/test/commits/1", t.url)
	end
end
