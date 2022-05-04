Feature: Run and view interviewer call history report
  As a TO Manager
  I want an operational report that gives me the call history for individual interviewers
  So that I can manage training requirements

  # Scenario 1:
  Scenario: Run and view interviewer call history report
    Given An interviewer ID and time period (start date and end date) has been specified
    When I click next to retrieve a list of instruments
    When I select an instrument and click on run report
    Then I will receive a list of the following information relating to that interviewer for each call worked on, during the time period specified:
    """
      * Questionnaire
      * Serial Number
      * Call Start Time
      * Call Length
      * Interviews
      * Call Result
    """

