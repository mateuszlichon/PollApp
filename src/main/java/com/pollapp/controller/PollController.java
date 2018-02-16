package com.pollapp.controller;

import com.pollapp.entity.Category;
import com.pollapp.entity.Comment;
import com.pollapp.entity.Poll;
import com.pollapp.repository.PollRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/polls")
public class PollController {

	@Autowired
	private PollRepository pollRepository;
	
    @GetMapping("")
    public List<Poll> getPoll() {
        return pollRepository.findAll();
    }

    @PostMapping("")
    public Poll createPoll() {
        // TODO
        return null;
    }

    @GetMapping("/{pollId}")
    public Poll getPoll(@PathVariable long pollId) {
        // TODO
        return null;
    }

    @PutMapping("/{pollId}")
    public Poll updatePoll(@PathVariable long pollId) {
        // TODO
        return null;
    }

    @DeleteMapping("/{pollId}")
    public Poll deletePoll(@PathVariable long pollId) {
        // TODO
        return null;
    }

    @GetMapping("/{pollId}/categories")
    public List<Category> getCategoriesByPoll(@PathVariable long pollId) {
        // TODO
        return null;
    }

    @GetMapping("/{pollId}/comments")
    public List<Comment> getCommentsByPoll(@PathVariable long pollId) {
        // TODO
        return null;
    }
}
