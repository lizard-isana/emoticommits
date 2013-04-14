require 'test/unit'

$:.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))
require 'githubarchive/endpoints'

include GitHubArchive

class TestApi < Test::Unit::TestCase
	def datapath(basename)
		File.join(File.dirname(__FILE__), 'sample-json', basename)
	end

	def test_timestamp
		t = Api.new(datapath('SingleCommitComment.json'))
		t.read_and_parse
		assert_equal(Time.utc(2013,4,12,18,1,44), t.timestamp)
	end
end

class TestSingleCommitComment < Test::Unit::TestCase
	def test_url
		t = SingleCommitComment.new('zunda', 'test', '1')
		assert_equal("#{Api::HOST}/repos/zunda/test/comments/1", t.url)
	end
end
